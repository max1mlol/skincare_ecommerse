import * as React from "react"

// Гар утасны дэлгэцийн өргөний хязгаар (пикселээр)
const MOBILE_BREAKPOINT = 768

// useIsMobile: Дэлгэцийн хэмжээ гар утасных эсэхийг тодорхойлох custom hook
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    // Media query ашиглан дэлгэцийн өргөнийг хянах
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Хэмжээ өөрчлөгдөх бүрт ажиллах функц
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange) // Өөрчлөлтийг сонсогч нэмэх
    
    // Эхний ачааллалтын үед шалгах
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Бүрэлдэхүүн хэсэг устгагдах үед сонсогчийг цэвэрлэх
    return () => mql.removeEventListener("change", onChange);
  }, [])

  return !!isMobile
}
