// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import AudioToText from './AudioToText';
import Container from "react-bootstrap/Container";


export function App() {
  return (
    <Container className="py-5 text-center">
    <h2 className={styles.topContainer}>Suki Medical Transcription App</h2>
    <AudioToText />
  </Container>
  );
}

export default App;
