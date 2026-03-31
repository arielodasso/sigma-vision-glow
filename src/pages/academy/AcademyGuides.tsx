import { motion } from "framer-motion";

const AcademyGuides = () => {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-secondary/50 border border-border p-10 lg:p-16 text-center"
      >
        <p className="text-xs font-semibold tracking-widest text-muted-foreground/60 uppercase mb-4">Mejores prácticas</p>
        <h1 className="font-display text-3xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
          Cómo usar IA de forma efectiva
        </h1>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
          Cinco principios que separan los grandes resultados de los frustrantes.
        </p>
      </motion.section>

      {/* Intro */}
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-foreground/80 italic text-lg leading-relaxed">
          La diferencia entre quienes logran resultados increíbles con IA y quienes se frustran suele reducirse a una cosa: cómo formulan sus instrucciones. No qué tan ingeniosas son, sino cómo piensan el proceso.
        </p>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Estos cinco principios surgen de observar cientos de proyectos exitosos (y fallidos), de la experiencia de nuestro equipo y de la comunidad. Ya sea que estés empezando o lleves decenas de proyectos, estos principios te van a ahorrar tiempo y mejorar tus resultados.
        </p>
      </div>

      {/* Principles */}
      <div className="space-y-16">
        <PrincipleSection
          number={1}
          title="Sabé qué querés construir antes de empezar"
          paragraphs={[
            "El error más común al trabajar con IA no es una mala instrucción. Es dar instrucciones demasiado pronto, antes de haber pensado realmente qué se necesita.",
            "La IA es increíblemente rápida para construir cosas. Esa velocidad es un superpoder, pero también puede engañarte para que saltes la parte de pensar. Y cuando saltás el análisis, terminás gastando diez intentos arreglando lo que una instrucción clara habría resuelto a la primera.",
          ]}
          tips={[
            { label: "01", text: "Empezá por lo básico: ¿cuál es el problema? ¿quién lo usa?" },
            { label: "02", text: "Mapeá el recorrido del usuario, no solo la pantalla" },
            { label: "03", text: "Usá un documento de planificación antes de arrancar" },
            { label: "04", text: "No te saltees la dirección de diseño" },
          ]}
        />

        <PrincipleSection
          number={2}
          title="Construí una pieza a la vez"
          paragraphs={[
            "Este es el principio que más tiempo ahorra y menos frustración genera. Y sin embargo, es el que más gente quiere saltear.",
            "Cuando pedís demasiado de una sola vez, la IA tiene que tomar muchas decisiones simultáneas. Algunas van a ser correctas, otras no, y el resultado será difícil de depurar.",
          ]}
          tips={[
            { label: "01", text: "Un componente o funcionalidad por instrucción" },
            { label: "02", text: "Verificá cada paso antes de seguir al siguiente" },
            { label: "03", text: "Usá instrucciones incrementales, no monolíticas" },
          ]}
        />

        <PrincipleSection
          number={3}
          title="Sé específico con lo que querés"
          paragraphs={[
            "\"Hacé un dashboard\" puede significar mil cosas distintas. \"Hacé un dashboard con una barra lateral, tres cards de métricas arriba, y un gráfico de líneas abajo\" es mucho más útil.",
            "La especificidad no requiere ser técnica. Podés describir lo que ves en tu cabeza, mencionar ejemplos de referencia, o explicar qué datos querés mostrar.",
          ]}
          tips={[
            { label: "01", text: "Describí layout, colores, y estructura visual" },
            { label: "02", text: "Mencioná sitios de referencia o capturas de pantalla" },
            { label: "03", text: "Explicá los datos y el flujo del usuario" },
          ]}
        />

        <PrincipleSection
          number={4}
          title="Iterá en lugar de rehacer"
          paragraphs={[
            "Cuando algo no sale exactamente como querías, la tentación es empezar de nuevo. Resistí esa tentación.",
            "Es mucho más efectivo iterar sobre lo que ya tenés. Decile a la IA qué cambiar específicamente: \"mové el botón a la derecha\", \"cambiá el color del header\", \"agregá un campo de email\".",
          ]}
          tips={[
            { label: "01", text: "Señalá exactamente qué querés cambiar" },
            { label: "02", text: "Usá capturas de pantalla para mostrar problemas" },
            { label: "03", text: "No borres todo si solo necesitás ajustar detalles" },
          ]}
        />

        <PrincipleSection
          number={5}
          title="Entendé los límites y aprovechá las fortalezas"
          paragraphs={[
            "La IA es excelente para generar UI, estructurar datos, crear lógica de negocio y conectar servicios. No es ideal para algoritmos altamente específicos de tu dominio sin contexto.",
            "Dále contexto sobre tu negocio, tus usuarios y tus objetivos. Cuanto más entienda el problema, mejor será la solución.",
          ]}
          tips={[
            { label: "01", text: "Proporcioná contexto de negocio y dominio" },
            { label: "02", text: "Usá archivos de conocimiento para información persistente" },
            { label: "03", text: "Combiná la velocidad de la IA con tu expertise de dominio" },
          ]}
        />
      </div>
    </div>
  );
};

const PrincipleSection = ({
  number,
  title,
  paragraphs,
  tips,
}: {
  number: number;
  title: string;
  paragraphs: string[];
  tips: { label: string; text: string }[];
}) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="space-y-6"
  >
    <h2 className="font-display text-2xl font-bold text-foreground">
      Principio {number}: {title}
    </h2>
    {paragraphs.map((p, i) => (
      <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
    ))}
    <div className="grid sm:grid-cols-2 gap-3 mt-6">
      {tips.map((tip) => (
        <div key={tip.label} className="rounded-xl border border-border bg-secondary/20 p-4">
          <span className="text-xs font-bold text-muted-foreground/50">{tip.label}</span>
          <p className="mt-1 text-sm text-foreground/80">{tip.text}</p>
        </div>
      ))}
    </div>
  </motion.section>
);

export default AcademyGuides;
