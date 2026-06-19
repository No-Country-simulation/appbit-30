import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faUser,
  faBell,
  faGear,
  faArrowRight,
  faArrowLeft,
  faHeart,
  faChartLine,
  faBars,
} from '@fortawesome/free-solid-svg-icons';

import {
  faGoogle,
  faGithub,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';

const icons = {
  user: faUser,
  bell: faBell,
  settings: faGear,
  arrowRight: faArrowRight,
  arrowLeft: faArrowLeft,
  heart: faHeart,
  chart: faChartLine,

  google: faGoogle,
  github: faGithub,
  linkedin: faLinkedin,

  menu: faBars,
};

type IconName = keyof typeof icons;

interface Props {
  name: IconName;
  className?: string;
}

export function AppIcon({ name, className }: Props) {
  return <FontAwesomeIcon icon={icons[name]} className={className} />;
}
