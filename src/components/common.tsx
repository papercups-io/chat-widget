import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Typography from 'antd/lib/typography';

import {blue, green, red, gold, grey} from '@ant-design/colors';

const {Title, Text, Paragraph} = Typography;

export const colors = {
  white: '#fff',
  black: '#000',
  primary: blue[5],
  green: green[5],
  red: red[5],
  gold: gold[5],
  blue: blue, // expose all blues
  gray: grey, // expose all grays
};

export const TextArea = Input.TextArea;

export {
  // Typography
  Title,
  Text,
  Paragraph,
  // Components
  Button,
  Input,
};
