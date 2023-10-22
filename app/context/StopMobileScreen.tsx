"use client";

// Note: I am too lazy to do the mobile version of the lobby, so I just made this component to stop people from using mobile devices >:)
export default function StopMobileScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="lg:hidden flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl text-white">
          Please use a<br></br>desktop device
        </h1>
      </div>
      <div className="hidden lg:block"> {children} </div>
    </div>
  );
}
