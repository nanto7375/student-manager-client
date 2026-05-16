import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { FlexBox } from "~/components/styled-elements";
import { InputXButton } from "~/components/input-x-button";

// --- Constants ---

const DAY_OF_WEEKS = [
  { title: '화', value: 2 },
  { title: '수', value: 3 },
  { title: '목', value: 4 },
  { title: '금', value: 5 },
  { title: '토', value: 6 },
  { title: '일', value: 0 },
] as const;

const SCHOOL_LEVELS = [
  { title: '초등', value: 1 },
  { title: '중등', value: 2 },
  { title: '고등', value: 3 },
] as const;

// --- Types ---

type Props = {
  inputName: string;
  onInputNameChange: (value: string) => void;
  onClearName: () => void;
  dayOfWeek: number | null | undefined;
  onDayOfWeekChange: (value: number | null) => void;
  schoolLevel: number | null | undefined;
  onSchoolLevelChange: (value: number | null) => void;
  children?: React.ReactNode;
};

// --- Helpers ---

const toggleValue = (current: number | null | undefined, next: number) =>
  current === next ? null : next;

// --- Component ---

const INPUT_STYLE = {
  padding: '0.5rem',
  paddingRight: '2rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  width: '200px',
} as const;

export const StudentSearchFilter = ({
  inputName,
  onInputNameChange,
  onClearName,
  dayOfWeek,
  onDayOfWeekChange,
  schoolLevel,
  onSchoolLevelChange,
  children,
}: Props) => (
  <FlexBox gap={1} alignItems="center" fullWidth>
    <FlexBox sx={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="이름으로 검색"
        value={inputName}
        onChange={(e) => onInputNameChange(e.target.value)}
        style={INPUT_STYLE}
      />
      {inputName && <InputXButton onClick={onClearName} />}
    </FlexBox>

    <ToggleButtonGroup value={dayOfWeek}>
      {DAY_OF_WEEKS.map(({ title, value }) => (
        <ToggleButton key={value} value={value} onClick={() => onDayOfWeekChange(toggleValue(dayOfWeek, value))}>
          {title}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>

    <ToggleButtonGroup value={schoolLevel}>
      {SCHOOL_LEVELS.map(({ title, value }) => (
        <ToggleButton key={value} value={value} onClick={() => onSchoolLevelChange(toggleValue(schoolLevel, value))}>
          {title}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>

    {children}
  </FlexBox>
);
