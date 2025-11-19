import { Link, useLocation } from "react-router";

const Breadcrumbs = ({ children }: { children: string }) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">{children}</h1>
      <nav>
        <ol className="flex gap-1 items-center capitalize">
          <li>
            <Link
              className="text-primary-600 hover:underline"
              to="/"
              title="home"
            >
              Home
            </Link>
          </li>

          {pathnames.map((path, index) => {
            const activePath = index === pathnames.length - 1;

            return (
              <div className="flex gap-1 items-center " key={index}>
                <span>/</span>
                <li>
                  {activePath ? (
                    <span>{path}</span>
                  ) : (
                    <Link
                      className="text-primary-600 hover:underline"
                      to={path}
                      title={path}
                    >
                      {path}
                    </Link>
                  )}
                </li>
              </div>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumbs;
