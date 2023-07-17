/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

interface CardProps {
  title: string;
  description: string;
  children: any;
  onSubmit?: any;
  onChange?: any;
  sx?: any;
}

const containerStyles = {
  padding: "40px 140px"
}

const headerStyles = {
  padding: "0",
  borderBottom: "1px solid #E0E0E0",
  marginBottom: "32px",
}

const ContainerCard = (props: CardProps) => {

  const {title, description, children, onSubmit, onChange, sx} = props;

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={containerStyles}
      onSubmit={onSubmit}
      onChange={onChange}
    >
      <Container sx={sx} maxWidth="lg" disableGutters>
        <Box sx={headerStyles}>
          <Typography variant="h4" component="div">
            {title}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {description}
          </Typography>
        </Box>   
        {children}
      </Container>  
    </Box>
  );
};

export default ContainerCard;
