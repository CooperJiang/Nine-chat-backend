const avatarImages = [
  'https://img0.baidu.com/it/u=2064236049,533493186&fm=26&fmt=auto',
  'https://img1.baidu.com/it/u=1897719880,2867606276&fm=26&fmt=auto',
  'https://img1.baidu.com/it/u=4257022723,1357471486&fm=26&fmt=auto',
  'https://img2.baidu.com/it/u=3770631990,1502164932&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=1670526758,2978193872&fm=26&fmt=auto',
  'https://img2.baidu.com/it/u=3136876758,3479953824&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=3452625090,3453768659&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=1800114517,4068633526&fm=26&fmt=auto',
  'https://img1.baidu.com/it/u=1220513416,3900720637&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=102394303,3578548733&fm=26&fmt=auto',
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
