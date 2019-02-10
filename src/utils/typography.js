import Typography from "typography"
import Wordpress2014 from "typography-theme-wordpress-2014"

Wordpress2014.overrideThemeStyles = () => {
  return {
    "a.gatsby-resp-image-link": {
      boxShadow: `none`,
    },
  }
}

delete Wordpress2014.googleFonts

const typography = new Typography(Wordpress2014)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
