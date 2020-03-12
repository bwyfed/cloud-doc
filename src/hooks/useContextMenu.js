import { useEffect, useRef } from 'react';
const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;

const useContextMenu = (itemArr, targetSelector, deps) => {
  let clickedElement = useRef(null);
  useEffect(() => {
    const menu = new Menu();
    itemArr.forEach(item => {
      menu.append(new MenuItem(item));
    });
    const handleContextMenu = e => {
      // only show the context menu on current dom element or targetSelector contains target
      if (document.querySelector(targetSelector).contains(e.target)) {
        clickedElement.current = e.target;
        menu.popup({ window: remote.getCurrentWindow });
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, deps); // 挂载的时候起作用，卸载的时候消失，所以dependencies是空数组
  return clickedElement;
};

export default useContextMenu;
