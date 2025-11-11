export const LEVEL_OPTIONS = [
  {
    label: "Bạch Kim",
    value: 1,
    image: "/images/task/level/1.png",
    reward: 500000,
    description: "Bạch Kim là cấp độ đầu tiên của hệ thống nhiệm vụ.",
    color: "blue",
  },
  {
    label: "Kim Cương",
    value: 2,
    image: "/images/task/level/2.png",
    reward: 700000,
    description: "Kim Cương là cấp độ thứ hai của hệ thống nhiệm vụ.",
    color: "green",
  },
  {
    label: "Tinh Anh",
    value: 3,
    image: "/images/task/level/3.png",
    reward: 1000000,
    description: "Tinh Anh là cấp độ thứ ba của hệ thống nhiệm vụ.",
    color: "yellow",
  },
  {
    label: "Cao Thủ",
    value: 4,
    image: "/images/task/level/4.png",
    reward: 4500000,
    description: "Cao Thủ là cấp độ thứ tư của hệ thống nhiệm vụ.",
    color: "red",
  },
  {
    label: "Chiến Tướng",
    value: 5,
    image: "/images/task/level/5.png",
    reward: 8300000,
    description: "Chiến Tướng là cấp độ thứ năm của hệ thống nhiệm vụ.",
    color: "purple",
  },
  {
    label: "Thách Đấu",
    value: 6,
    image: "/images/task/level/6.png",
    reward: 15000000,
    description: "Thách Đấu là cấp độ cuối cùng của hệ thống nhiệm vụ.",
    color: "orange",
  },
];

export const LEVEL_OPTIONS_SELECT = LEVEL_OPTIONS.map((level) => ({
  label: level.label,
  value: level.value,
}));

export const LEVEL_OPTIONS_MAP = new Map(
  LEVEL_OPTIONS.map((level) => [level.value, level])
);

export const getLevelOption = (value: number) => {
  return LEVEL_OPTIONS_MAP.get(value);
};
