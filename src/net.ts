import net, {createServer, Server, Socket} from "net";
import EventEmitter from "events";
import {logger} from "./log";
import {Color, Style} from "./color";
import {ChatData, MemberInfo, Message, SystemMessage} from "./data_types";

const port = 9000;

type Member = { name: string, socket: Socket };

enum ServerEventType {
    Message = "message",
    MemberConnected = "memberCon",
    MemberLeaved = "memberLeave"
}

enum ClientEventType {
    Message = "message",
    Connected = "connected",
    MemberAction = "memberAction"
}

enum MemberAction {
    Leave = "leave",
    Connect = "connect"
}

class Connection extends EventEmitter implements ChatData {
    name: string;
    username: string;
    address: string;
    connection: Socket | undefined;
    messages: Message[];
    members: MemberInfo[];

    protected constructor() {
        super();
        this.messages = [];
        this.members = [];
        this.name = "noname";
        this.username = "noname";
        this.address = "";
        this.connection = undefined;

        this.on(ClientEventType.Connected, (data) => this.onConnect(data));
        this.on(ClientEventType.Message, this.onMessage);
        this.on(ClientEventType.MemberAction, this.onMemberAction);
    }

    getMembers(): MemberInfo[] {
        return this.members;
    }

    getMessages(): Message[] {
        return this.messages;
    }

    onMemberAction(data: {action: 'leave' | 'connect', memberName: string}) {
        let message = "";
        if (data.action === MemberAction.Leave)  {
            this.members = this.members.filter((value) => value.name !== data.memberName)
            message = "User leaved";
        }
        else if (data.action === MemberAction.Connect) {
            this.members.push({ name: data.memberName! });
            message = "User connected";
        }

        this.messages.push(new SystemMessage(message, data.memberName));
        this.emit('draw');
    }

    onMessage(data: { content: string, userFrom: string }) {
        this.messages.push(new Message(data.content, data.userFrom));
        this.emit('draw');
    }

    onConnect(data: {channelName: string, members: string[]}) {
        this.name = data.channelName;
        this.members = data.members.map((value) => {return {name: value}});
    }

    static join(address: string, username: string): Connection {
        let channel = new Connection();
        let connection = net.createConnection({ host: address, port: port });

        channel.address = address;
        channel.connection = connection;
        channel.username = username;
        connection.on('error', (err) => {
            console.error("Error: ", err);
        });
        connection.on('data', (data) => {
            let obj = JSON.parse(data.toString());
            channel.emit(obj.type, obj.data);
        });
        let data = {
            type: ServerEventType.MemberConnected,
            data: {
                name: username
            }
        }
        connection.write(JSON.stringify(data));
        return channel;
    }

    sendMessage(text: string) {
        let messageData = {
            type: ClientEventType.Message,
            data: {
                content: text,
                userFrom: this.username
            }
        }
        this.connection!.write(JSON.stringify(messageData));
    }
}

class Host extends EventEmitter {
    server: Server | undefined;
    name: string;
    id: number;
    members: Member[];
    messages: Message[];

    protected constructor() {
        super();
        this.id = 0;
        this.name = "noname";
        this.members = [];
        this.messages = [];

        this.on(ServerEventType.Message, this.onMessage);
        this.on(ServerEventType.MemberConnected, this.onMemberCon);
        this.on(ServerEventType.MemberLeaved, this.onMemberLeave);
    }

    static host(name: string): Host {
        let host = new Host();
        let server = createServer();
        host.server = server;
        host.name = name;

        server.on('connection', client => {
            client.on('error', () => {}/*igonore*/);
            client.on('data', (data) => {
                let obj = JSON.parse(data.toString());
                if (obj.type === ServerEventType.MemberConnected) {
                    host.emit(obj.type, obj.data, client);
                    return;
                }
                host.emit(obj.type, obj.data);
            });
        }).listen(port);
        return host;
    }

    onMessage(data: { content: string, userFrom: string }) {
        logger.println(data.userFrom + ": " + data.content);
        this.messages.push(new Message(data.content, data.userFrom));
        this.members.forEach((value) => {
            let obj = {
                type: ClientEventType.Message,
                data: data
            }
            value.socket.write(JSON.stringify(obj));
        });
    }

    onMemberLeave(data: { name: string }) {
        this.members = this.members.filter((value) => value.name !== data.name);
        for (let i of this.members) {
            let data2 = {
                type: ClientEventType.MemberAction,
                data: {
                    action: MemberAction.Leave,
                    memberName: data.name
                }
            };
            i.socket.write(JSON.stringify(data2));
        }
    }

    onMemberCon(data: {name: string}, client: Socket) {
        client.on('close', (hadError) => {
            this.emit(ServerEventType.MemberLeaved, data);
        });
        for (let i of this.members) {
            let data2 = {
                type: ClientEventType.MemberAction,
                data: {
                    action: MemberAction.Connect,
                    memberName: data.name
                }
            };
            i.socket.write(JSON.stringify(data2));
        }

        this.members.push({ name: data.name, socket: client });

        let channelData = {
            type: ClientEventType.Connected,
            data: {
                channelName: this.name,
                members: this.members.map((value) => value.name)
            }
        }
        client.write(JSON.stringify(channelData));
        logger.println(
            logger.styled("User connected ", Color.Blue) +
            logger.styled(data.name, Style.Bold, Color.Green)
        );
    }
}

export {
    Connection,
    Host,
    Message
};
