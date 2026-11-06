import { useProgress } from '@/stores/app-context.tsx';
import { QuoteTraining } from './quote-training.tsx';
import { WordTraining } from './word-training.tsx';

export function TrainingScreen() {
	const mode = useProgress((state) => state.save.settings.trainingMode);
	return mode === 'quotes' ? <QuoteTraining /> : <WordTraining />;
}
