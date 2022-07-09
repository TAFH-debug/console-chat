import {logger} from "./log";
import {Color, Style} from "./color";

type MemberInfo = {
    name: string
};

interface ChatData {
    name: string;
    getMembers(): MemberInfo[];
    getMessages(): Message[];
    on(eventName: 'draw', listener: (...args: any[]) => void): void;
    on(eventName: 'connected', listener: (...args: any[]) => void): void;
}

class Message {
    content: string;
    userFrom: string;

    constructor(content: string, userFrom: string) {
        this.content = content;
        this.userFrom = userFrom;
    }

    getStyled(): string {
        return logger.styled(this.userFrom + ": ", Color.Green, Style.Bold) + this.content;
    }

    getRaw(): string {
        return this.userFrom + ": " + this.content;
    }
}

class SystemMessage extends Message {
    getStyled(): string {
        return logger.styled(this.content, Color.Blue) + " " + logger.styled(this.userFrom, Color.Green, Style.Bold);
    }

    getRaw(): string {
        return this.content + " " + this.userFrom;
    }
}

export {
    ChatData,
    MemberInfo,
    Message,
    SystemMessage
}