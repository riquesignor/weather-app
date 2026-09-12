/**
 * Estado do "diário de cultivo" — tarefas da horta, streak de atividade, plantas em
 * acompanhamento. Isso é dado do USUÁRIO (o que ele plantou, o que já regou hoje), não
 * dado de clima — por isso vive fora do `weather-provider` (que só cuida do que vem da
 * API). Em memória por enquanto (some ao reiniciar o app); virar persistente é o mesmo
 * próximo passo natural já anotado para os favoritos (AsyncStorage).
 */
import { useCallback, useState } from 'react';

export type GardenTask = { id: string; label: string; done: boolean };
export type GardenPlant = { id: string; name: string; daysLeft: number };

const SEED_TASKS: GardenTask[] = [
  { id: '1', label: 'Regar a horta às 7h', done: true },
  { id: '2', label: 'Adubar os canteiros', done: false },
  { id: '3', label: 'Remover ervas daninhas', done: false },
];

const SEED_PLANTS: GardenPlant[] = [
  { id: '1', name: 'Tomate cereja', daysLeft: 12 },
  { id: '2', name: 'Alface', daysLeft: 5 },
  { id: '3', name: 'Manjericão', daysLeft: 20 },
];

export function useGardenLog() {
  const [tasks, setTasks] = useState<GardenTask[]>(SEED_TASKS);
  const [plants] = useState<GardenPlant[]>(SEED_PLANTS);
  const [activityStreak, setActivityStreak] = useState(4);
  const [activityLoggedToday, setActivityLoggedToday] = useState(false);
  const [gardenLoggedToday, setGardenLoggedToday] = useState(false);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const logActivity = useCallback(() => {
    setActivityLoggedToday((already) => {
      if (!already) setActivityStreak((s) => s + 1);
      return true;
    });
  }, []);

  const logGarden = useCallback(() => setGardenLoggedToday(true), []);

  return {
    tasks,
    plants,
    activityStreak,
    activityLoggedToday,
    gardenLoggedToday,
    toggleTask,
    logActivity,
    logGarden,
  };
}
