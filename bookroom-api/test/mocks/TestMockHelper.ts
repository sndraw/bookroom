/**
 * 测试模拟工具类
 * 根据环境变量和测试上下文决定是否使用模拟数据
 */

// 测试模式类型
export enum TestMode {
  REAL = 'real',    // 使用真实API
  MOCK = 'mock',    // 使用模拟数据
  AUTO = 'auto'     // 根据环境变量自动决定
}

// 模拟响应类型
export interface MockResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * 测试模拟辅助类
 */
export class TestMockHelper {
  private static _instance: TestMockHelper;
  private _defaultMode: TestMode = TestMode.AUTO;
  private _forceMode: TestMode | null = null;

  /**
   * 获取单例实例
   */
  public static getInstance(): TestMockHelper {
    if (!TestMockHelper._instance) {
      TestMockHelper._instance = new TestMockHelper();
    }
    return TestMockHelper._instance;
  }

  /**
   * 设置测试模式
   * @param mode 测试模式
   */
  public setMode(mode: TestMode): void {
    this._forceMode = mode;
    console.log(`测试模式已设置为: ${mode}`);
  }

  /**
   * 重置测试模式为默认
   */
  public resetMode(): void {
    this._forceMode = null;
    console.log(`测试模式已重置为默认: ${this._defaultMode}`);
  }

  /**
   * 获取当前测试模式
   * @returns 当前测试模式
   */
  public getMode(): TestMode {
    // 如果有强制设置的模式，使用强制模式
    if (this._forceMode !== null) {
      return this._forceMode;
    }

    // 如果默认模式是AUTO，则检查环境变量
    if (this._defaultMode === TestMode.AUTO) {
      // 检查必要的环境变量是否存在
      const requiredEnvVars = ['TEST_AGENT_ID', 'TEST_TOKEN'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      return missingVars.length === 0 ? TestMode.REAL : TestMode.MOCK;
    }

    return this._defaultMode;
  }

  /**
   * 检查是否应使用模拟数据
   * @returns 是否应使用模拟数据
   */
  public shouldUseMock(): boolean {
    return this.getMode() === TestMode.MOCK;
  }

  /**
   * 获取模拟响应
   * @param mockData 模拟数据
   * @returns 模拟响应对象
   */
  public getMockResponse<T>(mockData: T): MockResponse<T> {
    return {
      success: true,
      data: mockData,
      statusCode: 200
    };
  }

  /**
   * 获取模拟错误响应
   * @param errorMessage 错误消息
   * @param statusCode HTTP状态码
   * @returns 模拟错误响应对象
   */
  public getMockErrorResponse(errorMessage: string, statusCode: number = 400): MockResponse {
    return {
      success: false,
      error: errorMessage,
      statusCode
    };
  }
}

// 导出默认实例
export default TestMockHelper.getInstance(); 