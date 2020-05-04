import React, { ChangeEvent, ReactElement, useState } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { decryptString } from 'grasshopper-ts'

import { RootState } from '../../store'
import { LoadingState, User as UserModel } from '../../reducers'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '1 0 auto',
    },
    container: {
      minWidth: '70%',
      display: 'flex',
      flexDirection: 'column',
      border: 'solid',
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.12)',
      borderWidth: 1,
      paddingRight: theme.spacing(4),
      paddingLeft: theme.spacing(4),
    },
    field: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
    button: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    }
  })
)

interface Props {
  loading: LoadingState;
  user: UserModel;
}


interface FormState {
  keyGost: string;
  decryptedData: string;
}

const UserComponent = ({ user }: Props): ReactElement => {
  const classes = useStyles()

  const [formState, setFormState] = useState<FormState>({
    keyGost: '',
    decryptedData: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if(value.length <= 50) {
      setFormState(prevState => ({ ...prevState, keyGost: value }))
    }
  }

  const decryptData = (): void => {
    setFormState(prevState => ({
      ...prevState,
      decryptedData: decryptString(user.userData, formState.keyGost),
    }))
  }

  const isDecryptButtonActive = formState.keyGost.length >= 40

  return (
    <div className={classes.root}>
      <form className={classes.container}>
        <TextField
          className={classes.field}
          variant='filled'
          label='Ключ ГОСТ'
          value={formState.keyGost}
          onChange={handleChange}
        />
        <TextField
          disabled
          className={classes.field}
          variant='filled'
          label='Обезличенные персональные данные'
          value={user.userData}
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
        <TextField
          disabled
          className={classes.field}
          variant='filled'
          label='Деобезличенные персональные данные'
          value={formState.decryptedData}
        />
      </form>
    </div>
  )
}

export const User = connect(
  (state: RootState) => ({
    loading: state.user.fetchingUser,
    user: state.user.user,
  }),
)(UserComponent)
