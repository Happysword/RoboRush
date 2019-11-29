export default class ScoreManager {

    Score : number;
    Lose : boolean;

    constructor()
    {
        this.Restart();
    }

    public ChangeScore(value : number)
    {
        this.Score += value;
    }

    public LoseGame()
    {
        this.Lose = true;
    }

    public Restart()
    {
        this.Score = 0;
        this.Lose = false;
    }
}