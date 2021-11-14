import * as moment from 'moment';

export const formatDate = (dateNum: string | number): string => {
  return moment(dateNum).format('YYYY-MM-DD HH:mm:ss');
};
