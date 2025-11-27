interface DashboardCardProps {
  title: string;
  stat: number | string;
  icon: React.ReactNode;
}

const DashboardCard = ({ title, stat, icon }: DashboardCardProps) => {
  return (
    <div>
      <div>
        <h2>{title}</h2>
        <p>{stat}</p>
      </div>
      <div>{icon}</div>
    </div>
  );
};

export default DashboardCard;
