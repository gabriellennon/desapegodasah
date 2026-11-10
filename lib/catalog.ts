export type Product = {
  id: string
  name: string
  category: "Roupas" | "Bolsas" | "Calçados" | "Acessórios"
  brand: string
  size: string
  price: number
  image: string
  photos?: { src: string; label: string }[]
  condition: string
  description: string
  sold?: boolean
}

// Visual fixtures only. Replace with approved products and photos before launch.
export const products: Product[] = [
  {
    id: "01",
    name: "Calça de alfaiataria",
    category: "Roupas",
    brand: "Seleção casual",
    size: "P",
    price: 129,
    image: "/images/trousers.jpg",
    condition: "Muito bem conservada",
    description:
      "Modelagem de cintura alta e caimento leve. Uma base versátil para combinar com o que você já tem.",
  },
  {
    id: "02",
    name: "Jaqueta utilitária",
    category: "Roupas",
    brand: "Seleção casual",
    size: "M",
    price: 189,
    image: "/images/jacket.jpg",
    condition: "Muito bem conservada",
    description:
      "Uma terceira peça com bolsos e acabamento estruturado, para acompanhar diferentes estações.",
  },
  {
    id: "03",
    name: "Bolsa de ombro",
    category: "Bolsas",
    brand: "Seleção de acessórios",
    size: "Único",
    price: 159,
    image: "/images/bag.jpg",
    condition: "Com sinais leves de uso",
    description:
      "Formato compacto e alça de ombro. Espaço para os pequenos essenciais do dia a dia.",
  },
  {
    id: "04",
    name: "Vestido midi floral",
    category: "Roupas",
    brand: "Seleção de vestidos",
    size: "P",
    price: 149,
    image: "/images/dress.jpg",
    condition: "Muito bem conservado",
    description:
      "Silhueta leve e estampa floral para dias de sol. Uma peça para vestir sem complicar.",
  },
  {
    id: "05",
    name: "Camiseta essencial",
    category: "Roupas",
    brand: "Seleção casual",
    size: "M",
    price: 59,
    image: "/images/knit.jpg",
    condition: "Muito bem conservada",
    description:
      "Camiseta de manga curta e modelagem confortável. Um básico para muitas combinações.",
  },
  {
    id: "06",
    name: "Sapato de salto",
    category: "Calçados",
    brand: "Seleção de calçados",
    size: "37",
    price: 119,
    image: "/images/shoes.jpg",
    condition: "Com sinais leves de uso",
    description:
      "Salto fino e acabamento delicado. Para dar outro ritmo às produções do dia a dia.",
  },
  {
    id: "07",
    name: "Jaqueta jeans",
    category: "Roupas",
    brand: "Seleção casual",
    size: "G",
    price: 139,
    image: "/images/blouse.jpg",
    condition: "Muito bem conservada",
    description:
      "Jeans com textura e modelagem descontraída. Uma peça fácil de levar para todo lugar.",
    sold: true,
  },
  {
    id: "08",
    name: "Óculos de sol",
    category: "Acessórios",
    brand: "Seleção de acessórios",
    size: "Único",
    price: 89,
    image: "/images/sunglasses.jpg",
    condition: "Com sinais leves de uso",
    description:
      "Armação marcante para completar o look. Consulte as informações reais da peça quando o catálogo for publicado.",
  },
]

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    price
  )
