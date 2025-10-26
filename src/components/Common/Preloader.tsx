const Preloader = () => {
  return (
    <>
      <div className="modal_inset" />
      <div className="modal_parent">
        <div className="relative h-22 w-22">
          <div className="bg-white h-20 w-20 rounded-full shadow-lg absolute z-10 top-1/2 left-1/2 -translate-1/2"></div>
          <div className="absolute top-0 left-0 h-full w-full rounded-full">
            <div className="rounded-full w-full h-full border-transparent border-6 border-t-accent-teal animate-spin" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Preloader;
