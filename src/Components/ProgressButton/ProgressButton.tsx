import React, { ReactElement } from 'react'
import Button, { ButtonProps } from '@material-ui/core/Button'
import { CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  buttonContainer: {
    position: 'relative',
    display: 'flex',
  },
  button: {
    flexGrow: 1,
  },
  progress: {
    color: 'primary',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
    position: 'absolute',
  },
})

interface Props extends ButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: string;
}

export const ProgressButton = ({ children, disabled, loading, onClick, ...restProps }: Props): ReactElement => {
  const classes = useStyles()

  return (
    <div className={classes.buttonContainer}>
      <Button
        {...restProps}
        style={{ flexGrow: 1, }}
        disabled={loading || disabled}
        variant='contained'
        size='large'
        onClick={onClick}
      >
        {children}
      </Button>
      {loading && <CircularProgress size={24} className={classes.progress}/>}
    </div>
  )
}
