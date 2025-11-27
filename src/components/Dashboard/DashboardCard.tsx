interface DashboardCardProps {
  title: string;
  stat: number | string;
  icon: React.ReactNode;
  bg_color: string;
}

const DashboardCard = ({ title, stat, icon, bg_color }: DashboardCardProps) => {
  return (
    <div
      className={`${bg_color} rounded-md py-6 px-4 flex justify-between items-start text-white shadow-md`}
    >
      <div className="space-y-2">
        <h2 className="font-light text-sm">{title}</h2>
        <p className="font-bold text-4xl">{stat}</p>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  );
};

export default DashboardCard;
