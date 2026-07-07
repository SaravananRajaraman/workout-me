import type { DayType, ExerciseSeed, LibraryExercise, ScheduleDay, Slot, WeekSchedule } from './types';

export const exercisesByDay: Record<DayType, ExerciseSeed[]> = {
  push: [
    { name: 'Barbell Bench Press', muscle: 'Chest', sets: 4, reps: 8, last: 60, img: '/img/bench.jpg', tip: 'Retract your shoulder blades and lower the bar to mid-chest with control.', alts: [
      { name: 'Dumbbell Bench Press', muscle: 'Chest', reps: 10, last: 24, img: '/img/alt-db-bench.jpg', tip: 'Great if the bench rack is busy — lets each arm work independently.' },
      { name: 'Push-Up', muscle: 'Chest', reps: 15, last: 0, img: '/img/alt-pushup.jpg', tip: 'Bodyweight fallback — keep a straight line from head to heels.' } ] },
    { name: 'Incline Dumbbell Press', muscle: 'Upper Chest', sets: 3, reps: 10, last: 22, img: '/img/incline-db.jpg', tip: 'Set the bench to ~45°. Press up and slightly inward, squeezing at the top.', alts: [
      { name: 'Incline Barbell Press', muscle: 'Upper Chest', reps: 8, last: 40, img: '/img/alt-incline-bb.jpg', tip: 'Heavier upper-chest option — lower the bar to just below the collarbone.' } ] },
    { name: 'Seated DB Shoulder Press', muscle: 'Shoulders', sets: 3, reps: 10, last: 18, img: '/img/shoulder-press.jpg', tip: "Brace your core and keep elbows slightly in front — don't flare them out.", alts: [
      { name: 'Arnold Press', muscle: 'Shoulders', reps: 10, last: 16, img: '/img/alt-arnold.jpg', tip: 'Rotate palms as you press to hit all three delt heads.' } ] },
    { name: 'Cable Fly', muscle: 'Chest', sets: 3, reps: 12, last: 15, img: '/img/cable-fly.jpg', tip: 'Keep a slight bend in the elbows and squeeze the chest at the mid-point.', alts: [
      { name: 'Pec Deck Machine', muscle: 'Chest', reps: 12, last: 40, img: '/img/alt-pec-deck.jpg', tip: 'Fixed path — perfect for a controlled squeeze at the end of the workout.' },
      { name: 'Dumbbell Flyes', muscle: 'Chest', reps: 12, last: 12, img: '/img/alt-db-fly.jpg', tip: "Big stretch at the bottom — don't go too heavy." } ] },
    { name: 'Lateral Raise', muscle: 'Side Delts', sets: 3, reps: 15, last: 10, img: '/img/lateral-raise.jpg', tip: 'Lead with your elbows, raise to shoulder height, and control the way down.', alts: [
      { name: 'Front Raise', muscle: 'Front Delts', reps: 12, last: 10, img: '/img/alt-front-raise.jpg', tip: 'Hits the front delts — raise to eye level, no swinging.' } ] },
    { name: 'Triceps Rope Pushdown', muscle: 'Triceps', sets: 3, reps: 12, last: 25, img: '/img/triceps-pushdown.jpg', tip: 'Pin your elbows to your sides and fully lock out at the bottom.', alts: [
      { name: 'Bench Dips', muscle: 'Triceps', reps: 12, last: 0, img: '/img/alt-bench-dip.jpg', tip: 'Bodyweight option — keep elbows tucked and lower under control.' } ] },
    { name: 'Treadmill Incline Walk', muscle: 'Cardio', time: true, dur: 12, img: '/img/treadmill.jpg', tip: 'Finish with a brisk incline walk to stay in the fat-burning zone.' },
  ],
  pull: [
    { name: 'Deadlift', muscle: 'Back', sets: 4, reps: 6, last: 90, img: '/img/deadlift.jpg', tip: 'Keep a flat back, brace hard, and drive through your heels.', alts: [
      { name: 'Romanian Deadlift', muscle: 'Hamstrings', reps: 10, last: 60, img: '/img/alt-rdl.jpg', tip: 'Softer on the lower back — push hips back and feel the hamstring stretch.' } ] },
    { name: 'Wide-Grip Lat Pulldown', muscle: 'Back', sets: 4, reps: 10, last: 55, img: '/img/lat-pulldown.jpg', tip: 'Pull the bar to your upper chest, driving your elbows down and back.', alts: [
      { name: 'Pull-Up', muscle: 'Back', reps: 8, last: 0, img: '/img/alt-pullup.jpg', tip: "The gold standard — use an assist band if you can't hit the reps yet." } ] },
    { name: 'Seated Cable Row', muscle: 'Back', sets: 3, reps: 10, last: 60, img: '/img/cable-row.jpg', tip: 'Chest up, pull to your stomach, and squeeze the shoulder blades together.', alts: [
      { name: 'Bent-Over Barbell Row', muscle: 'Back', reps: 10, last: 50, img: '/img/alt-bb-row.jpg', tip: 'Hinge to ~45°, pull to your belly button, keep the back flat.' },
      { name: 'T-Bar Row', muscle: 'Back', reps: 10, last: 45, img: '/img/alt-tbar.jpg', tip: 'Great for mid-back thickness — drive the elbows back.' } ] },
    { name: 'Dumbbell Shrug', muscle: 'Traps', sets: 3, reps: 12, last: 20, img: '/img/shrug.jpg', tip: 'Shrug straight up and pause hard at the top — no rolling.' },
    { name: 'Face Pull', muscle: 'Rear Delts', sets: 3, reps: 15, last: 25, img: '/img/face-pull.jpg', tip: 'Keep elbows high and pull the rope towards your forehead.', alts: [
      { name: 'Reverse Flyes', muscle: 'Rear Delts', reps: 15, last: 8, img: '/img/alt-rev-fly.jpg', tip: 'Bend at the hips and raise the dumbbells out wide — squeeze the rear delts.' } ] },
    { name: 'Barbell Curl', muscle: 'Biceps', sets: 3, reps: 12, last: 30, img: '/img/barbell-curl.jpg', tip: 'No swinging — keep elbows fixed and squeeze at the top.', alts: [
      { name: 'Dumbbell Curl', muscle: 'Biceps', reps: 12, last: 14, img: '/img/alt-db-curl.jpg', tip: 'Alternate arms and supinate the wrist as you curl.' },
      { name: 'Hammer Curl', muscle: 'Biceps', reps: 12, last: 14, img: '/img/alt-hammer.jpg', tip: 'Neutral grip — builds the brachialis and forearms.' } ] },
  ],
  legs: [
    { name: 'Barbell Back Squat', muscle: 'Quads', sets: 4, reps: 8, last: 80, img: '/img/squat.jpg', tip: 'Hips back, knees tracking your toes, and descend below parallel.', alts: [
      { name: 'Hack Squat', muscle: 'Quads', reps: 10, last: 80, img: '/img/alt-hack.jpg', tip: 'Machine-guided — safer to push close to failure on the quads.' },
      { name: 'Goblet Squat', muscle: 'Quads', reps: 12, last: 24, img: '/img/alt-goblet.jpg', tip: 'Hold a dumbbell at your chest — great for depth and form.' } ] },
    { name: 'Leg Press', muscle: 'Quads', sets: 3, reps: 12, last: 140, img: '/img/leg-press.jpg', tip: "Feet shoulder-width, and don't lock your knees at the top.", alts: [
      { name: 'Dumbbell Squat', muscle: 'Quads', reps: 12, last: 24, img: '/img/alt-db-squat.jpg', tip: 'Hold dumbbells at your sides — a solid free-weight substitute.' } ] },
    { name: 'Walking Lunge (DB)', muscle: 'Glutes', sets: 3, reps: 12, last: 16, img: '/img/lunge.jpg', tip: 'Take a long stride and drop your back knee towards the floor.', alts: [
      { name: 'Barbell Step-Ups', muscle: 'Glutes', reps: 12, last: 20, img: '/img/alt-stepup.jpg', tip: 'Drive through the heel of the top foot — control the descent.' } ] },
    { name: 'Leg Extension', muscle: 'Quads', sets: 3, reps: 15, last: 45, img: '/img/leg-extension.jpg', tip: 'Squeeze your quads at the top and lower slowly.' },
    { name: 'Standing Calf Raise', muscle: 'Calves', sets: 4, reps: 15, last: 60, img: '/img/calf-raise.jpg', tip: 'Get a full stretch at the bottom and pause at the top.', alts: [
      { name: 'Seated Calf Raise', muscle: 'Calves', reps: 15, last: 40, img: '/img/alt-seated-calf.jpg', tip: 'Bent knees target the soleus — pause hard at the top.' } ] },
  ],
};

export const extraLib: Record<DayType, ExerciseSeed[]> = {
  push: [
    { name: 'Machine Chest Press', muscle: 'Chest', reps: 12, last: 45, img: '/img/machine-press.jpg', tip: 'Fixed path — great for chasing failure safely at the end.' },
    { name: 'Decline Bench Press', muscle: 'Chest', reps: 10, last: 55, img: '/img/decline-bench.jpg', tip: 'Targets the lower chest — keep the bar path over the lower pecs.' },
    { name: 'Chest Dip', muscle: 'Chest', reps: 10, last: 0, img: '/img/chest-dip.jpg', tip: 'Lean forward to bias the chest — control the descent.' },
    { name: 'Standing Barbell Press', muscle: 'Shoulders', reps: 8, last: 40, img: '/img/military-press.jpg', tip: 'Brace hard, press overhead, and keep ribs down.' },
    { name: 'EZ-Bar Skullcrusher', muscle: 'Triceps', reps: 12, last: 25, img: '/img/skullcrusher.jpg', tip: 'Lower to your forehead, elbows fixed — keep it strict.' },
    { name: 'Overhead Triceps Extension', muscle: 'Triceps', reps: 12, last: 16, img: '/img/oh-tricep-ext.jpg', tip: 'Big stretch overhead — keep elbows pointing forward.' },
  ],
  pull: [
    { name: 'Chin-Up', muscle: 'Back', reps: 8, last: 0, img: '/img/chinup.jpg', tip: 'Underhand grip hits the lats and biceps — full hang to chin over bar.' },
    { name: 'Close-Grip Pulldown', muscle: 'Back', reps: 10, last: 50, img: '/img/close-pulldown.jpg', tip: 'Neutral close grip — drive elbows to your ribs.' },
    { name: 'One-Arm Dumbbell Row', muscle: 'Back', reps: 10, last: 28, img: '/img/one-arm-row.jpg', tip: 'Support on a bench, row to the hip, and get a full stretch.' },
    { name: 'Barbell Shrug', muscle: 'Traps', reps: 12, last: 60, img: '/img/bb-shrug.jpg', tip: 'Shrug straight up, hold at the top — heavier than dumbbells.' },
    { name: 'Preacher Curl', muscle: 'Biceps', reps: 10, last: 25, img: '/img/preacher-curl.jpg', tip: 'Pinned elbows on the pad isolate the biceps — no cheating.' },
    { name: 'Cable Curl', muscle: 'Biceps', reps: 12, last: 25, img: '/img/cable-curl.jpg', tip: 'Constant tension through the whole range — squeeze at the top.' },
    { name: 'Concentration Curl', muscle: 'Biceps', reps: 12, last: 12, img: '/img/concentration-curl.jpg', tip: 'Seated, elbow on thigh — the ultimate biceps peak isolator.' },
  ],
  legs: [
    { name: 'Front Squat', muscle: 'Quads', reps: 8, last: 50, img: '/img/front-squat.jpg', tip: 'Elbows high, torso upright — hammers the quads.' },
    { name: 'Lying Leg Curl', muscle: 'Hamstrings', reps: 12, last: 40, img: '/img/lying-leg-curl.jpg', tip: "Curl fully and squeeze — don't let the weight drop." },
    { name: 'Seated Leg Curl', muscle: 'Hamstrings', reps: 12, last: 45, img: '/img/seated-leg-curl.jpg', tip: 'Great hamstring stretch under load — controlled reps.' },
    { name: 'Stiff-Leg Deadlift', muscle: 'Hamstrings', reps: 10, last: 60, img: '/img/stiff-deadlift.jpg', tip: 'Soft knees, hinge at the hips, feel the hamstring stretch.' },
    { name: 'Barbell Hip Thrust', muscle: 'Glutes', reps: 12, last: 70, img: '/img/hip-thrust.jpg', tip: 'Drive through the heels and squeeze the glutes hard at the top.' },
    { name: 'Glute Bridge', muscle: 'Glutes', reps: 15, last: 40, img: '/img/glute-bridge.jpg', tip: 'Floor-based glute builder — pause at the top of each rep.' },
  ],
};

export const day2Default: Record<DayType, string[]> = {
  push: ['dumbbell-bench-press', 'incline-barbell-press', 'standing-barbell-press', 'machine-chest-press', 'arnold-press', 'ez-bar-skullcrusher', 'chest-dip'],
  pull: ['romanian-deadlift', 'pull-up', 'bent-over-barbell-row', 'barbell-shrug', 'reverse-flyes', 'preacher-curl', 'hammer-curl'],
  legs: ['front-squat', 'hack-squat', 'lying-leg-curl', 'barbell-hip-thrust', 'goblet-squat', 'seated-calf-raise'],
};

export const groupOf: Record<string, string> = {
  Chest: 'Chest', 'Upper Chest': 'Chest', Shoulders: 'Shoulders', 'Side Delts': 'Shoulders', 'Front Delts': 'Shoulders', 'Rear Delts': 'Shoulders',
  Triceps: 'Triceps', Cardio: 'Cardio', Back: 'Back', Traps: 'Traps', Biceps: 'Biceps', Quads: 'Quads', Hamstrings: 'Hamstrings', Glutes: 'Glutes', Calves: 'Calves',
};

export const defaultSchedule: WeekSchedule = { 0: 'rest', 1: 'push', 2: 'pull', 3: 'legs', 4: 'push', 5: 'pull', 6: 'legs' };
export const typeName: Record<ScheduleDay, string> = { push: 'Push Day', pull: 'Pull Day', legs: 'Leg Day', rest: 'Rest Day' };
export const typeSub: Record<ScheduleDay, string> = { push: 'Chest · Shoulders · Triceps', pull: 'Back · Traps · Biceps', legs: 'Quads · Glutes · Calves', rest: 'Recover & grow' };

/** Week in display order (Monday-first), with short day names. */
export const weekDows: { dow: number; label: string }[] = [
  { dow: 1, label: 'Mon' }, { dow: 2, label: 'Tue' }, { dow: 3, label: 'Wed' },
  { dow: 4, label: 'Thu' }, { dow: 5, label: 'Fri' }, { dow: 6, label: 'Sat' },
  { dow: 0, label: 'Sun' },
];

export interface WeekView {
  typeByDow: Record<number, ScheduleDay>;
  slotByDow: Partial<Record<number, Slot>>;
  labels: { dow: number; letter: string; label: string }[];
}

/**
 * Expands a per-weekday schedule into the day-type/slot mappings the app runs on.
 * Occurrences of a type within the week (Mon→Sun) alternate between its Day 1
 * and Day 2 slots, so the existing two-variant plan system keeps working.
 */
export function deriveWeek(schedule: WeekSchedule): WeekView {
  const typeByDow: Record<number, ScheduleDay> = {};
  const slotByDow: Partial<Record<number, Slot>> = {};
  const counts: Record<DayType, number> = { push: 0, pull: 0, legs: 0 };
  const labels: WeekView['labels'] = [];
  weekDows.forEach(({ dow, label }) => {
    const type: ScheduleDay = schedule[dow] ?? 'rest';
    typeByDow[dow] = type;
    if (type !== 'rest') {
      counts[type] += 1;
      slotByDow[dow] = `${type}${counts[type] % 2 === 1 ? 1 : 2}` as Slot;
    }
    labels.push({ dow, letter: type === 'rest' ? 'R' : type === 'legs' ? 'L' : 'P', label });
  });
  return { typeByDow, slotByDow, labels };
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export interface WorkoutLibrary {
  library: Record<DayType, LibraryExercise[]>;
  libById: Record<string, LibraryExercise>;
  defaultPlan: Record<DayType, string[]>;
}

export function buildLibrary(): WorkoutLibrary {
  const library: Record<DayType, LibraryExercise[]> = { push: [], pull: [], legs: [] };
  const libById: Record<string, LibraryExercise> = {};
  const defaultPlan: Record<DayType, string[]> = { push: [], pull: [], legs: [] };

  (['push', 'pull', 'legs'] as DayType[]).forEach((type) => {
    const seen: Record<string, boolean> = {};
    const add = (o: ExerciseSeed, sets?: number): string => {
      const id = slug(o.name);
      if (seen[id]) return id;
      seen[id] = true;
      const item: LibraryExercise = {
        id,
        type,
        name: o.name,
        muscle: o.muscle,
        group: groupOf[o.muscle] || o.muscle,
        img: o.img,
        tip: o.tip,
        sets: o.sets || sets || 3,
        reps: o.reps != null ? o.reps : 12,
        last: o.last != null ? o.last : 20,
        time: !!o.time,
        dur: o.dur || 0,
      };
      library[type].push(item);
      libById[id] = item;
      return id;
    };
    exercisesByDay[type].forEach((ex) => {
      const id = add(ex, ex.sets);
      defaultPlan[type].push(id);
      (ex.alts || []).forEach((a) => add(a, ex.sets));
    });
    (extraLib[type] || []).forEach((ex) => add(ex, ex.sets));
  });

  return { library, libById, defaultPlan };
}

export function slotBase(slot: Slot): DayType {
  return slot.replace(/[12]$/, '') as DayType;
}
export function slotDayNum(slot: Slot): 1 | 2 {
  return slot.slice(-1) === '2' ? 2 : 1;
}
export const allSlots: Slot[] = ['push1', 'push2', 'pull1', 'pull2', 'legs1', 'legs2'];
