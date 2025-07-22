// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import Header from "../../components/ui/header/index"
// import Footer from "../../components/ui/footer/index"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import {
//   ClipboardList,
//   FolderKanban,
//   FilePlus2,
//   User2Icon,
//   SearchCheckIcon,
//   ArrowRight,
//   Sparkles,
// } from "lucide-react"
// import { getDatabase, ref, get } from "firebase/database"
// import { app } from "../../../firebase"

// export default function Home() {
//   const [hoveredCard, setHoveredCard] = useState(null)
//   const navigate = useNavigate()

//   const [totais, setTotais] = useState({
//     cameras: 0,
//     notebooks: 0,
//     tablets: 0,
//     moveis: 0,
//     fones: 0,
//     impressoras: 0,
//   })

//   const [loadingTotais, setLoadingTotais] = useState(true)

//   const db = getDatabase(app)

//   useEffect(() => {
//     async function fetchTotals() {
//       setLoadingTotais(true)

//       const keys = ["notebooks", "tablets", "moveis", "fones", "impressoras", "cameras"]

//       const promises = keys.map(async (key) => {
//         const snapshot = await get(ref(db, key))
//         const data = snapshot.val()
//         return { key, count: data ? Object.keys(data).length : 0 }
//       })

//       const results = await Promise.all(promises)
//       const newTotals = {}
//       results.forEach(({ key, count }) => {
//         newTotals[key] = count
//       })

//       setTotais(newTotals)
//       setLoadingTotais(false)
//     }

//     fetchTotals()
//   }, [db])

//   const cards = [
//     {
//       title: "Registers",
//       description: "Create and manage new records efficiently",
//       icon: <FilePlus2 className="w-8 h-8" />,
//       onClick: () => navigate("/register-option"),
//       color: "from-blue-500 to-blue-600",
//       bgColor: "bg-blue-50",
//       textColor: "text-blue-700",
//       badge: "New",
//       badgeColor: "bg-blue-100 text-blue-700",
//     },
//     {
//       title: "Profile",
//       description: "View and edit your user profile",
//       icon: <User2Icon className="w-8 h-8" />,
//       onClick: () => navigate("/perfil"),
//       color: "from-indigo-500 to-indigo-600",
//       bgColor: "bg-indigo-50",
//       textColor: "text-indigo-700",
//       badge: "You",
//       badgeColor: "bg-indigo-100 text-indigo-700",
//     },
//     {
//       title: "Search",
//       description: "Find and filter through your data quickly",
//       icon: <SearchCheckIcon className="w-8 h-8" />,
//       onClick: () => navigate("/views"),
//       color: "from-emerald-500 to-emerald-600",
//       bgColor: "bg-emerald-50",
//       textColor: "text-emerald-700",
//       badge: "Popular",
//       badgeColor: "bg-emerald-100 text-emerald-700",
//     },
//     {
//       title: "Dashboard",
//       description: "View analytics and key performance metrics",
//       icon: <FolderKanban className="w-8 h-8" />,
//       onClick: () => navigate("/dashboard"),
//       color: "from-purple-500 to-purple-600",
//       bgColor: "bg-purple-50",
//       textColor: "text-purple-700",
//       badge: "Updated",
//       badgeColor: "bg-purple-100 text-purple-700",
//     },
//     {
//       title: "Users",
//       description: "Manage user accounts and permissions",
//       icon: <User2Icon className="w-8 h-8" />,
//       onClick: () => navigate("/register-user"),
//       color: "from-orange-500 to-orange-600",
//       bgColor: "bg-orange-50",
//       textColor: "text-orange-700",
//       badge: "Admin",
//       badgeColor: "bg-orange-100 text-orange-700",
//     },
//     {
//       title: "Support",
//       description: "Handle customer inquiries and tickets",
//       icon: <ClipboardList className="w-8 h-8" />,
//       onClick: () => navigate("/chamados"),
//       color: "from-rose-500 to-rose-600",
//       bgColor: "bg-rose-50",
//       textColor: "text-rose-700",
//       badge: "Active",
//       badgeColor: "bg-rose-100 text-rose-700",
//     },
//   ]

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50">
//       <Header />

//       <main className="flex-1 p-6 lg:p-8">
//         {/* Hero Section */}
//         <div className="mb-12 text-center">
//           <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
//             <Sparkles className="w-4 h-4 text-blue-600" />
//             <span className="text-sm font-medium text-gray-700">Welcome back!</span>
//           </div>
//           <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Your Control Center</h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Access all your tools and manage your workflow from one central location
//           </p>
//         </div>
//                 {/* Quick Stats */}
//         <div className="mt-16 max-w-4xl mx-auto">
//           {loadingTotais ? (
//             <div className="flex justify-center py-10">
//               <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
//               <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
//                 <div className="text-3xl font-bold text-gray-900 mb-2">{totais.notebooks}</div>
//                 <div className="text-gray-600">Total de Notebooks</div>
//               </div>
//               <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
//                 <div className="text-3xl font-bold text-gray-900 mb-2">{totais.tablets}</div>
//                 <div className="text-gray-600">Total de Tablets</div>
//               </div>
//               <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
//                 <div className="text-3xl font-bold text-gray-900 mb-2">{totais.moveis}</div>
//                 <div className="text-gray-600">Total de Mobiliarios</div>
//               </div>
//               <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
//                 <div className="text-3xl font-bold text-gray-900 mb-2">{totais.fones}</div>
//                 <div className="text-gray-600">Total de Fones</div>
//               </div>
//               <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
//                 <div className="text-3xl font-bold text-gray-900 mb-2">{totais.impressoras}</div>
//                 <div className="text-gray-600">Total de Impressoras</div>
//               </div>
//               <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
//                 <div className="text-3xl font-bold text-gray-900 mb-2">{totais.cameras}</div>
//                 <div className="text-gray-600">Total de Cameraas</div>
//               </div>
//             </div>
//           )}
//           <br />
//         {/* Cards Grid */}
//         <div className="max-w-6xl mx-auto">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {cards.map((card, idx) => (
//               <Card
//                 key={idx}
//                 className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 overflow-hidden ${
//                   hoveredCard === idx ? "shadow-2xl scale-105" : "shadow-md"
//                 }`}
//                 onMouseEnter={() => setHoveredCard(idx)}
//                 onMouseLeave={() => setHoveredCard(null)}
//                 onClick={card.onClick}
//               >
//                 <CardContent className="p-0">
//                   {/* Gradient Header */}
//                   <div className={`h-2 bg-gradient-to-r ${card.color}`} />

//                   <div className="p-6">
//                     {/* Badge */}
//                     <div className="flex justify-between items-start mb-4">
//                       <div
//                         className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}
//                       >
//                         <div className={card.textColor}>{card.icon}</div>
//                       </div>
//                       <Badge variant="secondary" className={`${card.badgeColor} border-0`}>
//                         {card.badge}
//                       </Badge>
//                     </div>

//                     {/* Content */}
//                     <div className="space-y-3">
//                       <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
//                         {card.title}
//                       </h3>
//                       <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
//                     </div>

//                     {/* Action Button */}
//                     <div className="mt-6 flex items-center justify-between">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className={`${card.textColor} hover:bg-transparent p-0 h-auto font-medium group-hover:gap-2 transition-all duration-300`}
//                       >
//                         Get Started
//                         <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../../components/ui/header/index"
import Footer from "../../components/ui/footer/index"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardList,
  FolderKanban,
  FilePlus2,
  User2Icon,
  SearchCheckIcon,
  ArrowRight,
  Sparkles,
  Laptop,
  Tablet,
  Armchair,
  Headphones,
  Printer,
  Camera,
} from "lucide-react"
import { getDatabase, ref, get } from "firebase/database"
import { app } from "../../../firebase"

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const navigate = useNavigate()
  const [totais, setTotais] = useState({
    cameras: 0,
    notebooks: 0,
    tablets: 0,
    moveis: 0,
    fones: 0,
    impressoras: 0,
  })
  const [loadingTotais, setLoadingTotais] = useState(true)
  const db = getDatabase(app)

  useEffect(() => {
    async function fetchTotals() {
      setLoadingTotais(true)
      const keys = ["notebooks", "tablets", "moveis", "fones", "impressoras", "cameras"]
      const promises = keys.map(async (key) => {
        const snapshot = await get(ref(db, key))
        const data = snapshot.val()
        return { key, count: data ? Object.keys(data).length : 0 }
      })
      const results = await Promise.all(promises)
      const newTotals = {}
      results.forEach(({ key, count }) => {
        newTotals[key] = count
      })
      setTotais(newTotals)
      setLoadingTotais(false)
    }
    fetchTotals()
  }, [db])

  const cards = [
    {
      title: "Registers",
      description: "Create and manage new records efficiently",
      icon: <FilePlus2 className="w-8 h-8" />,
      onClick: () => navigate("/register-option"),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      badge: "New",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      title: "Profile",
      description: "View and edit your user profile",
      icon: <User2Icon className="w-8 h-8" />,
      onClick: () => navigate("/perfil"),
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      badge: "You",
      badgeColor: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Search",
      description: "Find and filter through your data quickly",
      icon: <SearchCheckIcon className="w-8 h-8" />,
      onClick: () => navigate("/views"),
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      badge: "Popular",
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Dashboard",
      description: "View analytics and key performance metrics",
      icon: <FolderKanban className="w-8 h-8" />,
      onClick: () => navigate("/dashboard"),
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      badge: "Updated",
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: <User2Icon className="w-8 h-8" />,
      onClick: () => navigate("/register-user"),
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      badge: "Admin",
      badgeColor: "bg-orange-100 text-orange-700",
    },
    {
      title: "Support",
      description: "Handle customer inquiries and tickets",
      icon: <ClipboardList className="w-8 h-8" />,
      onClick: () => navigate("/chamados"),
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700",
      badge: "Active",
      badgeColor: "bg-rose-100 text-rose-700",
    },
  ]

  const statsConfig = [
    { key: "notebooks", label: "Notebooks", icon: Laptop, color: "from-blue-500 to-cyan-500" },
    { key: "tablets", label: "Tablets", icon: Tablet, color: "from-purple-500 to-pink-500" },
    { key: "moveis", label: "Mobiliários", icon: Armchair, color: "from-amber-500 to-orange-500" },
    { key: "fones", label: "Fones", icon: Headphones, color: "from-green-500 to-emerald-500" },
    { key: "impressoras", label: "Impressoras", icon: Printer, color: "from-indigo-500 to-purple-500" },
    { key: "cameras", label: "Câmeras", icon: Camera, color: "from-red-500 to-pink-500" },
  ]

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
        <div className="w-full h-4 bg-gray-200 rounded"></div>
        <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-blue-100/80 to-purple-100/80 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Welcome back!</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 leading-tight">
              Your Control Center
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Access all your tools and manage your workflow from one central location with powerful insights and
              seamless navigation
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Equipment Overview</h2>
              <p className="text-gray-600">Real-time inventory statistics</p>
            </div>

            {loadingTotais ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="w-16 h-8 bg-gray-200 rounded"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {statsConfig.map((stat, idx) => {
                  const IconComponent = stat.icon
                  return (
                    <div
                      key={stat.key}
                      className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{totais[stat.key]}</div>
                          <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cards Grid */}
          <div className="mb-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600">Navigate to your most used features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {cards.map((card, idx) => (
                <Card
                  key={idx}
                  className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm ${
                    hoveredCard === idx
                      ? "shadow-2xl scale-[1.02] ring-2 ring-blue-200/50"
                      : "shadow-lg hover:-translate-y-2"
                  }`}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={card.onClick}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <CardContent className="p-0 relative overflow-hidden">
                    {/* Gradient Header with Animation */}
                    <div
                      className={`h-1.5 bg-gradient-to-r ${card.color} group-hover:h-2 transition-all duration-300`}
                    />

                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                      <div className={`w-full h-full bg-gradient-to-br ${card.color} rounded-full blur-3xl`} />
                    </div>

                    <div className="p-6 sm:p-8 relative">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className={`p-4 rounded-2xl ${card.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}
                        >
                          <div className={card.textColor}>{card.icon}</div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${card.badgeColor} border-0 font-medium px-3 py-1 group-hover:scale-105 transition-transform duration-300`}
                        >
                          {card.badge}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="space-y-4 mb-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                          {card.title}
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{card.description}</p>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${card.textColor} hover:bg-transparent p-0 h-auto font-semibold text-sm group-hover:gap-3 transition-all duration-300 group/btn`}
                        >
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
