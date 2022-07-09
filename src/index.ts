import {Connection, Host} from "./net";
import {Color, Style} from "./color";
import {logger} from "./log";
import {Chat} from "./ui";
import * as readline from "readline";

class Command {
    name: string;
    needStdin: boolean;

    constructor(name: string, needStdin: boolean, handler: (...args: string[]) => void) {
        this.needStdin = needStdin;
        this.name = name;
        this.handler = handler;
    }

    handler(...args: string[]) {}
}

class Program {

    commands: Command[]
    connection: Connection | undefined;
    server: Host | undefined;

    constructor() {
        this.commands = [];

        this.commands.push(new Command("exit", true, Program.exit));
        this.commands.push(new Command("join", true, Program.join));
        this.commands.push(new Command("host", true, Program.host));
        this.commands.push(new Command("clear", false, Program.clear));
    }

    static join(address: string, username: string) {
        let connection = Connection.join(address, username);
        const rl = readline.createInterface(process.stdin);
        rl.on('line', (data) => {
            connection?.sendMessage(data);
        });
        let chat = new Chat(connection);
        chat.start();
    }

    static clear() {
        process.stdout.write("\x1b[2J");
    }

    static host(chat_name: string) {
        let server = Host.host(chat_name);
        process.stdin.on('data', (buf) => {
            let data = buf.toString();
            server;
        });
    }

    static exit() {
        logger.printlnStyled("Exiting...", Color.Turquoise);
        process.exit(0);
    }

    shell() {
        let listener = (d: Float32Array) => {
            let strarr = d.slice(0, d.length - 2)
                .toString()
                .split(" ");
            let cmd = strarr[0],
                args = strarr.slice(1, strarr.length);

            let found = false;
            for (let i of this.commands) {
                if (cmd === i.name) {
                    found = true;
                    i.handler(...args);
                    if (i.needStdin) process.stdin.removeListener('data', listener);
                    else process.stdout.write("> ");
                    break;
                }
            }

            if (!found) {
                logger.printlnStyled("Command not found!", Color.Red);
                process.stdout.write("> ");
            }
        };
        process.stdout.write("> ");
        process.stdin.on('data', listener);

    }


    run() {
        logger.printlnStyled("Hello!", Style.Bold, Color.Green);
        this.shell();
    }
}

function createProgram(): Program {
    return new Program();
}

const program = createProgram();

program.run()