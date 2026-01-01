import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    id: 1,
    title: "AI-Powered Diet Plan",
    description: "Get a personalized diet plan based on your fitness goals and health metrics."
  },
  {
    id: 2,
    title: "ML Posture Detection",
    description: "Improve your form with real-time posture analysis using machine learning."
  },
  {
    id: 3,
    title: "Rep Counter & Guide",
    description: "Track your exercise reps accurately and get feedback on your performance."
  },
  {
    id: 4,
    title: "Posture Correctness",
    description: "Receive corrections and insights to avoid injuries and maximize gains."
  }
];

export default function FeaturesSection() {
  return (
    <div className="bg-[#e4e4e4] text-black py-20 px-6 min-h-screen flex flex-col">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900">Empowering Fitness Through AI</h2>
        <p className="text-lg mt-4 text-gray-600">
          Smart tools to help you achieve your fitness goals with AI-driven insights.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-10 flex-grow">
        {features.map((feature) => (
          <Card key={feature.id} className="bg-gray-100 rounded-2xl p-4 text-center shadow-lg border border-gray-300">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 mt-2 text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="bg-[#e4e4e4] w-full h-40 mt-10 flex items-center justify-center text-gray-700 text-2xl font-semibold">
        Empowering Excellence.. For Tommorrow
      </div>
    </div>
  );
}
