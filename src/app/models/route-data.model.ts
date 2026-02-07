export interface RouteData {
	path: string,
	sidenav?: {
		text?: string;
	}
  header?: {
    title?: string;
  };
  footer?: {
    text?: string;
  };
}