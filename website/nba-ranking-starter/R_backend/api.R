library(plumber)
library(dplyr)

#* @apiTitle NBA Ranking API

# Enable CORS
#* @filter cors
cors <- function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req$REQUEST_METHOD == "OPTIONS") {
    return(list())
  } else {
    forward()
  }
}

# ------------------------------
# Load CSVs
# ------------------------------
rankings <- read.csv("ranking_model.csv")
stats    <- read.csv("nba_all_stats.csv")

# ------------------------------
# Join to add headshot_href
# ------------------------------
rankings <- rankings %>%
  left_join(
    stats %>% select(full_name, headshot_href),
    by = c("namePlayer" = "full_name")
  )

# ------------------------------
# Rankings endpoint
# ------------------------------
#* @get /rankings
function(limit = 360) {
  rankings %>%
    transmute(
      rank,
      namePlayer,
      team = team_abbreviation,
      pos  = position_abbreviation,
      headshot_href,
      score = round(TOTAL_100, 1)
    ) %>%
    head(as.numeric(limit))
}

# ------------------------------
# Compare endpoint
# ------------------------------
#* @get /compare
function(player1 = "", player2 = "", player3 = "", player4 = "") {
  players <- c(player1, player2, player3, player4)
  players <- players[players != ""]
  rankings %>%
    filter(namePlayer %in% players) %>%
    transmute(
      rank,
      namePlayer,
      team = team_abbreviation,
      pos  = position_abbreviation,
      headshot_href,
      score = round(TOTAL_100, 1)
    )
}

