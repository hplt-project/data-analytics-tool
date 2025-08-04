import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";

import "react-widgets/styles.css";

import styles from "@/styles/Home.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/viewer");
  }, []);

  return (
    <div className={styles.viewerContainer}>
      <Navbar />
      <Footer />
    </div>
  );
}
