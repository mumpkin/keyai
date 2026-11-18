import { useProgress } from '@/stores/app-context.tsx';
import { QuoteTraining } from './quote-training.tsx';
import { SpokenWordTraining } from './spoken/spoken-word-training.tsx';
import { WordTraining } from './word-training.tsx';

export function TrainingScreen() {
	const mode = useProgress((state) => state.save.settings.trainingMode);
	const input = useProgress((state) => state.save.settings.inputMode);
	if (mode === 'quotes') {
		return <QuoteTraining />;
	}
	return input === 'voice' ? <SpokenWordTraining /> : <WordTraining />;
}
