"use client";

// Note: I am too lazy to do the mobile version of the lobby, so I just made this component to stop people from using mobile devices >:)
export default function StopMobileScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="md:hidden flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-3xl text-white">Please use a desktop device</h1>
        <h4 className="text-gray-300 mt-4">
          (or just resize your browser window)
        </h4>
      </div>
      <div className="hidden md:block"> {children} </div>
    </div>
  );
}
