class BaseTool {
    public name: string | undefined;
    public version: string | undefined;
    public description: string | undefined;
    public inputSchema: object | undefined;
    public execute: (args: object) => Promise<any>;
    constructor(name?: string, version?: string) {
        this.name = name;
        this.version = version;
        this.description = "Base tool";
        this.inputSchema = {};
        this.execute = async (args: object): Promise<any> => args;
    }
}

export default BaseTool;