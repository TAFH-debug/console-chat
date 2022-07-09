import {BackgroundColor, CLEAR, Color, Style} from "./color";
import {Connection} from "./net";
import {logger} from "./log";
import {ChatData} from "./data_types";

export type BTData = {
    style: Style | undefined,
    color: Color | undefined,
    background: BackgroundColor | undefined
};

export type BTParam = Color | Style | BackgroundColor | undefined;

const isSomeEnum = <T>(e: T) => (token: any): token is T[keyof T] =>
    Object.values(e).includes(token as T[keyof T]);

const isColor = isSomeEnum(Color);
const isStyle = isSomeEnum(Style);
const isBackground = isSomeEnum(BackgroundColor);

export class BeautifulText {
    style: Style | undefined;
    color: Color | undefined;
    background: BackgroundColor | undefined;
    text: String

    constructor(text: String) {
        this.text = text;
    }

    setParam(param: BTParam): this {
        if (isColor(param))
            this.setColor(param);
        else if (isStyle(param))
            this.setStyle(param);
        else if (isBackground(param))
            this.setBackground(param);
        return this;
    }

    setStyle(style: Style): this {
        this.style = style;
        return this;
    }

    setColor(color: Color): this {
        this.color = color;
        return this;
    }

    setBackground(background: BackgroundColor): this {
        this.background = background;
        return this;
    }

    toString(): string {
        let style = this.style === undefined ? "" : this.style,
            color = this.color === undefined ? "" : this.color,
            background = this.background === undefined ? "" : this.background;
        return style + color + background + this.text + CLEAR;
    }
}

export function toBT(src: string): BeautifulText {
    return new BeautifulText(src);
}

const wall = "|";

export class Chat {
    chat: ChatData;
    width1: number;
    width2: number;
    flat: string;
    tableHeader: string;
    inputField: string;

    constructor(chat: Connection) {
        this.chat = chat;
        this.width1 = 60;
        this.width2 = 15;

        this.flat = "+" + "-".repeat(this.width1) + "+" + "-".repeat(this.width2) + "+";
        this.tableHeader = "";
        this.inputField = "| > " + " ".repeat(this.width1 + this.width2 - 2) + "|";
    }

    calcHeader(header1: string) {
        const header2 = "USERS";
        let halfLength1 = Math.floor((this.width1 - header1.length) / 2);
        let halfLength2 = Math.floor((this.width2 - header2.length) / 2);
        let spaces1 = " ".repeat(halfLength1);
        let spaces2 = " ".repeat(halfLength2);
        if (header1.length % 2 != 0) header1 = " " + header1;

        this.tableHeader = this.flat + "\n" + "|" + spaces1 + header1 + spaces1 + "|" +
            spaces2 + header2 + spaces2 + "|";
    }

    goto(x: number, y: number) {
        process.stdout.write(`\x1b[${y};${x}H`);
    }

    draw() {
        process.stdout.write("\x1b[2J");
        this.goto(0, 0);

        logger.println(this.tableHeader);
        logger.println(this.flat);
        this.chat.getMessages().forEach((i, index) => {
            let j = this.chat.getMembers()[index];

            let fm = wall + " " + i.getStyled();
            const length = (i.getRaw()).length + 1;
            const spaces_count = this.width1 - length;
            let fmessage = fm + " ".repeat(spaces_count);
            let fuser = j !== undefined ?
                wall + j.name + " ".repeat(this.width2 - j.name.length) + wall
                :
                wall + " ".repeat(this.width2) + wall;
            console.log(fmessage + fuser);
        });
        logger.println(this.flat);
        logger.println(this.inputField);
        logger.print(this.flat);
        this.goto(5, 5 + this.chat.getMessages().length);
    }

    start() {
        this.chat.on('connected', (data) => this.calcHeader(data.channelName));
        this.chat.on('draw', () => this.draw());
        this.draw();
    }
}