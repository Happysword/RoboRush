export default class ScoreManager {

    Score : number; // Player's score
    Lose : boolean; // If true then player lost (Hit an obstacle)

    constructor()
    {
        this.Restart();
    }
    
    // Made it send value so if other types of coins to give more points than 1 or if penalty value ? -1
    public ChangeScore(value : number)
    {
        this.Score += value;
    }

    // Just called from obstacles collision
    public LoseGame()
    {
        this.Lose = true;
    }

    // Should be called when user loses and presses again so score resets
    public Restart()
    {
        this.Score = 0;
        this.Lose = false;
    }
}