import FitnessServices from "./components/fitnessService";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section with Background Image */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="https://invertase.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2F6c8c2208b2198db37a82d185bca3646d.svg&w=3840&q=75"
          alt="background"
        />
        <div className="container relative pl-20">
          <div className="flex justify-between  pt-40 ml-10">
            <h1 className="fs-64 bg-[radial-gradient(89.47%_51.04%_at_44.27%_50%,_#E2E3E9_0%,_#D4D6DE_52.73%,_#3D3F4C_100%)] bg-clip-text pb-2.5 font-title font-medium text-transparent md:max-w-[600px] md:pb-2.5 md:text-40 sm:text-32 text-5xl">
              Use PosePulse..<br /> & Just fit in the Frame!
            </h1>
          </div>
          <div className="text-[#9c9eab] md:max-w-[600px] md:pb-2.5 md:text-40 sm:text-32  pt-4 ml-10">
            We help fitness enthusiasts and professionals achieve their health goals with innovative digital solutions.
          </div>
          <FitnessServices/>
        </div>
      </div>

      {/* White Background Section on Scroll */}
      {/* <div className="bg-[#e4e4e4] min-h-screen flex  justify-center text-black text-3xl font-bold">
        <FeaturesSection/>
      </div> */}
      {/* <Footer/> */}
    </div>
  );
}
