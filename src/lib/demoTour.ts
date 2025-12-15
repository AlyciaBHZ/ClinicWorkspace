import { driver, type Driver } from 'driver.js';

const TOUR_KEY = 'cw_guided_tour_state_v1';

export type TourState = {
  completed: boolean;
};

export function loadTourState(): TourState {
  try {
    const raw = localStorage.getItem(TOUR_KEY);
    if (!raw) return { completed: false };
    const parsed = JSON.parse(raw) as TourState;
    return { completed: !!parsed.completed };
  } catch {
    return { completed: false };
  }
}

export function saveTourState(state: TourState) {
  localStorage.setItem(TOUR_KEY, JSON.stringify(state));
}

export function resetTourState() {
  localStorage.removeItem(TOUR_KEY);
}

export function startDashboardTour(): Driver {
  const d = driver({
    showProgress: true,
    allowClose: true,
    steps: [
      {
        element: '[data-tour="demo-card"]',
        popover: {
          title: 'Guided Demo（场景播放器）',
          description: '这是 Spravato TRD 拒付申诉的“一键跑通”演示入口，会把 Case→证据→文档→版本→状态流转串起来。',
        },
      },
      {
        element: '[data-tour="run-full-scenario"]',
        popover: {
          title: 'Run full scenario',
          description: '一键执行：创建固定案例 exampleCaseId、自动 Pin 证据、生成 PA Pack & Appeal、保存 v1、设置状态。',
        },
      },
      {
        element: '[data-tour="stepper"]',
        popover: {
          title: 'Stepper（每步产出可追踪）',
          description: '每步会显示 Done/Not started，并可跳转到对应模块继续演示与编辑。',
        },
      },
      {
        element: '[data-tour="outputs-preview"]',
        popover: {
          title: 'Outputs preview（产出物预览）',
          description: '直接预览当前 active case 的 PA Pack / Appeal 最新版本，并支持 Open / Copy / Export PDF。',
        },
      },
    ],
    onDestroyed: () => {
      // Keep state in localStorage
      saveTourState({ completed: true });
    },
  });

  d.drive();
  return d;
}


