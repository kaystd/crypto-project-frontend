import React, { ChangeEvent, ReactElement, useState } from 'react'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { JSEncrypt } from 'jsencrypt'
import { decryptString } from 'grasshopper-ts'

import { User } from '../../reducers'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    details: {
      flexDirection: 'column',
    },
    field: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  }),
)

interface Props {
  expanded: boolean;
  onChange: (expandedElement: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
  user: User;
}

interface FormState {
  keyRsa: string;
  decryptedData: string;
}

export const ExpansionListPanel = ({ user, expanded, onChange }: Props): ReactElement => {
  const classes = useStyles()

  const [formState, setFormState] = useState<FormState>({
    keyRsa: '',
    decryptedData: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if(value.length <= 900) {
      setFormState(prevState => ({ ...prevState, keyRsa: value }))
    }
  }

  const decryptData = (): void => {
    const encrypt = new JSEncrypt()
    encrypt.setPrivateKey(formState.keyRsa)
    const decrypted = encrypt.decrypt(user.keyGost)
    let decryptedData = ''
    try {
      decryptedData = decryptString(user.userData, decrypted)
    } catch (err) {
      decryptedData = 'Неверный ключ'
    }

    setFormState(prevState => ({
      ...prevState,
      decryptedData,
    }))
  }

  const isDecryptButtonActive = formState.keyRsa.length >= 870

  return (
    <ExpansionPanel
      expanded={expanded}
      onChange={onChange(user.login)}
    >
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {user.login}
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details}>
        <TextField
          disabled
          className={classes.field}
          variant='filled'
          multiline
          label='Обезличенные персональные данные'
          value={user.userData}
        />
        <TextField
          disabled
          className={classes.field}
          variant='filled'
          multiline
          label='Зашифрованный ключ'
          value={user.keyGost}
        />
        <TextField
          className={classes.field}
          variant='filled'
          multiline
          label='Закрытый ключ RSA'
          value={formState.keyRsa}
          onChange={handleChange}
        />
        <TextField
          disabled
          className={classes.field}
          multiline
          variant='filled'
          label='Деобезличенные персональные данные'
          value={formState.decryptedData}
        />
        <Button
          disabled={!isDecryptButtonActive}
          className={classes.field}
          color='secondary'
          variant='contained'
          size='large'
          onClick={decryptData}
        >
          Деобезличить персональные данные
        </Button>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}
