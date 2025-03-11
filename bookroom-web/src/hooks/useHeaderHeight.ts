import { useEffect, useState } from 'react';

function useWindowSize() {
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerElement = (document.querySelector('.ant-pro-layout-header') ||
        document.querySelector(
          '.ant-page-header-has-breadcrumb',
        )) as HTMLElement | null;
      const fixedHeaderElement = document.querySelector(
        '.ant-pro-layout-header-fixed-header',
      ) as HTMLElement | null;
      if (headerElement) {
        let height = headerElement.offsetHeight;
        if (fixedHeaderElement) {
          height += fixedHeaderElement.offsetHeight;
        }
        setHeaderHeight(height);
      } else {
        setHeaderHeight(0);
      }
    };

    // 初始设置高度
    updateHeaderHeight();

    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  return headerHeight;
}

export default useWindowSize;
