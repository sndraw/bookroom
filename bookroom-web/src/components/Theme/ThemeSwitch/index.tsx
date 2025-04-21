import { Button } from "antd";
import { SunOutlined } from "@ant-design/icons";
import styles from "./index.less";
import classNames from "classnames";

type ThemeSwitchType = {
    className?: string;
};
const ThemeSwitch: React.FC<ThemeSwitchType> = (props) => {
    const { className } = props;
    return (
        <Button className={classNames(styles.themeSwitch, className)} type="link" onClick={() => {
            const isDark = localStorage.getItem('theme') === 'dark';
            if (isDark) {
                localStorage.setItem('theme', 'light');
            } else {
                localStorage.setItem('theme', 'dark');
            }
            window.location.reload();
        }}>
            <SunOutlined title="切换主题" />
        </Button>
    )
}

export default ThemeSwitch;