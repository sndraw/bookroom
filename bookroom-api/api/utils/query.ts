export interface SorterObj {
    [key: string]: 'ascend' | 'descend';
}
export type OrderType = [string, 'ASC' | 'DESC'];

export const getOrderArray = (sorter: SorterObj | string, orderArray?: OrderType[]): OrderType[] => {
    if (!orderArray) {
        orderArray = [
            ['createdAt', 'DESC']
        ]
    }
    if (!sorter) {
        return [
            ...orderArray
        ];
    }

    let sortObj: SorterObj;

    // 检查 sorter 是否为字符串类型
    if (typeof sorter === 'string') {
        try {
            sortObj = JSON.parse(sorter) as SorterObj;
        } catch (error) {
            console.error('Invalid JSON string:', sorter);
            return [];
        }
    } else {
        sortObj = sorter;
    }

    // 转换排序规则
    const sortArray: OrderType[] = Object.entries(sortObj).map(([key, value]) =>
        [key, value === 'ascend' ? 'ASC' : 'DESC']
    );
    return [...sortArray, ...orderArray];
};