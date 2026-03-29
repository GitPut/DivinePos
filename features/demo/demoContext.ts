// Module-level callbacks for switching demo views.
// Set by DemoPage, read by Header/LeftMenuBar to switch views.
let _onSwitchToPOS: (() => void) | null = null;
let _onSwitchToAdmin: (() => void) | null = null;

export const setDemoSwitchToPOS = (cb: (() => void) | null): void => {
  _onSwitchToPOS = cb;
};

export const getDemoSwitchToPOS = (): (() => void) | null => _onSwitchToPOS;

export const setDemoSwitchToAdmin = (cb: (() => void) | null): void => {
  _onSwitchToAdmin = cb;
};

export const getDemoSwitchToAdmin = (): (() => void) | null => _onSwitchToAdmin;
