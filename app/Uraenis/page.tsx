import { Press_Start_2P } from "next/font/google";
import UraenisClient from "./UraenisClient";

// 8-bit pixel display face for the Game Boy / Pokémon UI chrome
const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Uraenis — A Universe",
  description: "An interactive 8-bit star field. Explore it.",
};

export default function Uraenis() {
  return <UraenisClient fontClass={pixel.className} />;
}
