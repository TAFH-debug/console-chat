enum Color {
    Black = "\x1b[30m",
    Red = "\x1b[31m",
    Green = "\x1b[32m",
    Yellow = "\x1b[33m",
    Blue = "\x1b[34m",
    Purple = "\x1b[35m",
    Turquoise = "\x1b[36m",
    White = "\x1b[37m"
}

enum Style {
    Normal = "\x1b[0m",
    Bold = "\x1b[1m",
    Cursive = "\x1b[3m",
    Underline = "\x1b[4m",
}

enum BackgroundColor {
    Black = "\x1b[40m",
    Red = "\x1b[41m",
    Green = "\x1b[42m",
    Yellow = "\x1b[43m",
    Blue = "\x1b[44m",
    Purple = "\x1b[45m",
    Turquoise = "\x1b[46m",
    White = "\x1b[47m"
}

const CLEAR = "\x1b[0;0m";

export {
    CLEAR,
    BackgroundColor,
    Style,
    Color
}