/** @jsx jsx */
import {jsx} from 'theme-ui';

export const SendIcon = ({
  width,
  height,
  fill,
  className,
}: {
  width?: number;
  height?: number;
  fill?: string;
  className?: string;
}) => {
  return (
    <svg
      focusable='false'
      aria-hidden='true'
      height={height || 16}
      width={width || 16}
      viewBox='0 0 15 16'
      className={className}
      sx={{fill: fill || 'black'}}
    >
      <g transform='translate(-24.000000, -12.000000)'>
        <path d='M25.4036262,27.3409362 C24.4176893,27.8509036 23.8195834,27.3951055 24.0683403,26.3201996 L25.0887779,21.910776 C25.2131242,21.3734618 25.7510472,20.8884231 26.3078778,20.8254187 L32.503417,20.1244045 C34.151155,19.9379658 34.1569707,19.6389088 32.503417,19.4549971 L26.3078778,18.7659164 C25.7589338,18.7048617 25.2129433,18.217839 25.0887779,17.6798715 L24.0683403,13.2586546 C23.8198614,12.1820783 24.408944,11.7182276 25.4036262,12.2327184 L38.22304,18.8634497 C39.208977,19.373417 39.2177223,20.1957141 38.22304,20.7102049 L25.4036262,27.3409362 Z' />
      </g>
    </svg>
  );
};

export default SendIcon;
