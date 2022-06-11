const avatarImages = [
  'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fup.enterdesk.com%2Fedpic%2Fff%2F92%2Fde%2Fff92deb592080c5d113f3c589ad6ae5e.jpg&refer=http%3A%2F%2Fup.enterdesk.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1657539965&t=69e258a37ec430c0a05a0aa3c004a53d',
  'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202004%2F15%2F20200415141655_ihkmq.png&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1657539965&t=c7cf70d95b721ae21a08ff76e5571017',
  'https://img2.baidu.com/it/u=2183774629,3758018921&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img2.baidu.com/it/u=4256150975,3329534358&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202006%2F17%2F2020061792937_ZXQCe.thumb.1000_0.jpeg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1657539886&t=ab9746fc0e81775509291d9e11ed810e',
  'https://img2.baidu.com/it/u=3136876758,3479953824&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=3452625090,3453768659&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=1800114517,4068633526&fm=26&fmt=auto',
  'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202006%2F01%2F20200601091140_yNxua.thumb.400_0.jpeg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1657539965&t=ddc2af6b0404762088267b1c882a8ae6',
  'https://img2.baidu.com/it/u=2080680443,1125776408&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img1.baidu.com/it/u=3076342820,26164290&fm=253&fmt=auto&app=138&f=JPEG?w=400&h=400',
  'https://img1.baidu.com/it/u=999728032,2588274139&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img0.baidu.com/it/u=2348113243,2985082400&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img0.baidu.com/it/u=3219223402,3248683741&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=462',
  'https://img1.baidu.com/it/u=1738531146,3909274171&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img1.baidu.com/it/u=194801324,3941016336&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=502',
  'https://img1.baidu.com/it/u=4096419636,635686539&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img1.baidu.com/it/u=1063520357,634151768&fm=253&fmt=auto&app=138&f=JPEG?w=501&h=500',
  'https://img1.baidu.com/it/u=1840640137,796009368&fm=253&fmt=auto&app=138&f=JPEG?w=400&h=400',
  'https://img0.baidu.com/it/u=2808227484,2828723915&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img2.baidu.com/it/u=2139428454,11472061&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fup.enterdesk.com%2Fedpic%2Feb%2F52%2F72%2Feb52723f7f718af616c58036d144d9ac.jpeg&refer=http%3A%2F%2Fup.enterdesk.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1656446480&t=407531f57fe4df832c8049717e1d5270',
  'https://img2.baidu.com/it/u=3880907952,1315091092&fm=253&fmt=auto&app=138&f=JPEG?w=400&h=400',
  'https://img0.baidu.com/it/u=445630895,1325986660&fm=253&fmt=auto&app=138&f=JPEG?w=501&h=500',
  'https://img1.baidu.com/it/u=128191971,1598406876&fm=253&fmt=auto&app=138&f=JPEG?w=480&h=480',
  'https://img0.baidu.com/it/u=2874745006,3335345031&fm=253&fmt=auto&app=138&f=JPEG?w=400&h=400',
  'https://img0.baidu.com/it/u=1570864321,1900317849&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img0.baidu.com/it/u=3467758223,1877547427&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img1.baidu.com/it/u=2984860093,2281446768&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img0.baidu.com/it/u=3539067204,3422500556&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=523',
  'https://img2.baidu.com/it/u=3404678637,35400775&fm=253&fmt=auto&app=138&f=JPEG?w=400&h=400',
];

export const getRandomId = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomAvatar = () => {
  const index = getRandomId(0, avatarImages.length - 1);
  return avatarImages[index];
};
