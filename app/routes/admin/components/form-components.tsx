import { FormControl, InputLabel, MenuItem, Select, TextField, type SelectChangeEvent } from "@mui/material";
import { FlexBox } from "~/components/styled-elements";
import { AppleTg } from "~/components/typography";

export const FormInput = ({ id, label, value, onChange, type, error }: { id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, error?: boolean }) => {
  return (
    <FlexBox sx={{width: '20rem'}}><TextField label={label} id={id} value={value} onChange={onChange} type={type} error={error} fullWidth /></FlexBox>
  )
};

export const FormPhone = ({ id, label, value, onChange }: { id: string, label: string, value: string[], onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <FlexBox sx={{width: '20rem', gap: 1, justifyContent: 'center'}}>
      <TextField label={label} type="text" id={id + '/0'} value={value[0]} disabled inputProps={{ style: { textAlign: 'center' } }} />
      <TextField type="text" id={id + '/1'} value={value[1]} onChange={onChange} inputProps={{ style: { textAlign: 'center' } }} />
      <TextField type="text" id={id + '/2'} value={value[2]} onChange={onChange} inputProps={{ style: { textAlign: 'center' } }} />
    </FlexBox>
  )
};

type SelectItemProps = {
  id: string;
  defaultValue?: string | number | undefined;
  placeholder?: string;
  options: { value: string | number, label: string }[];
}
type FormSelectProps = {
  value: string[] | (string | number | undefined)[];
  onChange: (e: SelectChangeEvent, name: string) => void;
  items: SelectItemProps[];
}
export const FormSelect = ({ value, onChange, items }: FormSelectProps) => {
  return (
    <FlexBox sx={{width: '20rem', gap: 1}}>
      {items.map((item, index) => (
        <FormControl key={item.id} fullWidth sx={{minWidth: 0}}>
          <InputLabel id={item.id}>{item.placeholder}</InputLabel>
          <Select 
            labelId={item.id} 
            label={item.placeholder} 
            value={(value[index] === 0) ? 0 : value[index] || item.defaultValue || ''} 
            onChange={(e: SelectChangeEvent) => onChange(e, item.id)} 
            sx={{
              width: '100%',
              textAlign: 'center',
              height: '3.5rem',
              '& .MuiSelect-select': {
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }
            }}
          >  
            {item.options.map(option => (
              <MenuItem key={option.value} value={option.value} sx={{textAlign: 'center'}}><AppleTg>{option.label}</AppleTg></MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </FlexBox>
  )
};