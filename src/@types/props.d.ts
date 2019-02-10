import { RouteComponentProps } from 'react-router';
import * as H from 'history';
import { FormComponentProps } from 'antd/lib/form';

export interface Action {
  type: string;
  payload?: any;
}

export interface Dispatch<A extends Action> {
  <T extends A>(action: T): Promise<any>;
}

export interface ReduxProps {
  dispatch?: Dispatch<Action>;
  loading?: boolean;
}

export interface RouteLocation extends H.Location {
  query: any;
}

export interface RouteProps extends RouteComponentProps<any> {
  location: RouteLocation;
}

export interface FormProps extends FormComponentProps {
}
