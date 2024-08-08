import { Box, Card, CardContent, CardMedia, Typography, Tooltip, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const CardComponent = ({ id, name, description, link, media, previousInstallation, handleClick }:{id: string, name: string, description: string, link: string, media: any, previousInstallation: boolean, handleClick: any}) => {
  return (
    <Link key={`link-${id}`} to={previousInstallation ? "/" : link}>
      <Box sx={{ width: '40vw', height: '40vh' }} onClick={() => handleClick(id)}>
        <Card id={`card-${id}`} square={true}>
          <CardMedia sx={{ height: 240 }} image={media} />
          <CardContent className="action-card">
            <Box>
              <Typography variant="subtitle1" component="div">
                {name}
              </Typography>
              <Typography sx={{ mb: 1.5, mt: 1.5, fontSize: '0.875rem' }} color="text.secondary">
                {description}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Link>
  );
};

export default CardComponent;
