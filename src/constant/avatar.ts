const avatarImages = [
  'https://img0.baidu.com/it/u=2064236049,533493186&fm=26&fmt=auto',
  'https://img1.baidu.com/it/u=1897719880,2867606276&fm=26&fmt=auto',
  'https://img1.baidu.com/it/u=4257022723,1357471486&fm=26&fmt=auto',
  'https://img2.baidu.com/it/u=3770631990,1502164932&fm=26&fmt=auto',
  'https://img1.baidu.com/it/u=1235679188,872295587&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=3413948841,2661870664&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=4118467725,2171033744&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=1670526758,2978193872&fm=26&fmt=auto',
  'https://img2.baidu.com/it/u=3136876758,3479953824&fm=26&fmt=auto',
  'https://img2.baidu.com/it/u=3010850469,2813118839&fm=26&fmt=auto',
  'https://img2.baidu.com/it/u=2285567582,1185119578&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=3452625090,3453768659&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=1800114517,4068633526&fm=26&fmt=auto',
  'https://img1.baidu.com/it/u=1220513416,3900720637&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=1668941702,4253247057&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=2083621347,2276995712&fm=26&fmt=auto',
  'https://img2.baidu.com/it/u=2157983744,1504765592&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=1355225337,195579012&fm=26&fmt=auto',
  'https://img1.baidu.com/it/u=2775059443,2185860664&fm=26&fmt=auto',
  'https://img2.baidu.com/it/u=202823690,3290026690&fm=26&fmt=auto',
  'https://img2.baidu.com/it/u=358349854,3952534042&fm=26&fmt=auto',
  'https://img0.baidu.com/it/u=102394303,3578548733&fm=26&fmt=auto',
  'https://img1.baidu.com/it/u=4092157189,2476043363&fm=26&fmt=auto',
  'https://img1.baidu.com/it/u=1053673692,3714938453&fm=26&fmt=auto&gp=0.jpg',
  'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.duoziwang.com%2F2018%2F05%2F20171231191240.gif&refer=http%3A%2F%2Fimg.duoziwang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1635170571&t=66f63e1883cc38e91907f3c6fb7327a3',
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
