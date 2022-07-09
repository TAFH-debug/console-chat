import {BackgroundColor, Color, Style} from "./color";
import {BTData, BTParam, toBT} from "./ui";

enum Level {
    INFO = "INFO",
    ERROR = "ERROR",
    WARNING = "WARNING"
}

class Logger {
    info = (message: any) => this.log(message, Level.INFO);
    err = (message: any) => this.log(message, Level.ERROR);
    warn = (message: any) => this.log(message, Level.WARNING);

    log(message: any, level: Level) {
        console.log("[%s %s][%s] %s", Logger.getToday(), Logger.getNowTime(), level, message.toString());
    }
    println = (...args: any[]) => process.stdout.write(args.join(" ") + "\n");
    print = (...args: any[]) => process.stdout.write(args.join(" "));

    printlnStyled = (arg: any, p1?: BTParam, p2?: BTParam, p3?: BTParam) => this.printStyled(arg + "\n", p1, p2, p3);
    printStyled(arg: any, p1?: BTParam, p2?: BTParam, p3?: BTParam) {
        this.print(
            toBT(arg)
                .setParam(p1)
                .setParam(p2)
                .setParam(p3)
        );
    }

    styled(arg: any, p1?: BTParam, p2?: BTParam, p3?:BTParam): string {
        return toBT(arg)
            .setParam(p1)
            .setParam(p2)
            .setParam(p3)
            .toString();
    }

    static getNowTime(): string {
        return new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "numeric",
            minute: "numeric"
        });
    }

    static getToday(): string {
        return new Date().toLocaleDateString()
            .split(".")
            .reverse()
            .join(".");
        //formatting to format yyyy.mm.dd
    }
}

const logger = new Logger();

export { Level, Logger, logger };