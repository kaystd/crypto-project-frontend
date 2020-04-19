import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import { createMuiTheme, createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.background.paper,
      height: '100vh'
    },
  }),
)

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#673ab7',
    },
    secondary: {
      main: '#ef6c00'
    },
  },
})

export const App = (): React.ReactElement => {
  const classes = useStyles()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth='lg' className={classes.container}>
      </Container>
    </ThemeProvider>
  )
}
