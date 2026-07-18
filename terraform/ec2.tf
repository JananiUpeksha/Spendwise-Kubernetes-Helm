resource "aws_key_pair" "spendwise_key" {
  key_name   = "spendwise-terraform-key"
  public_key = file("./spendwise-terraform-key.pub")
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "spendwise_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.spendwise_key.key_name
  vpc_security_group_ids = [aws_security_group.spendwise_sg.id]

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  tags = {
    Name = "spendwise-server"
  }
}

resource "aws_eip" "spendwise_eip" {
  instance = aws_instance.spendwise_server.id
  domain   = "vpc"

  tags = {
    Name = "spendwise-eip"
  }
}

output "instance_public_ip" {
  value = aws_eip.spendwise_eip.public_ip
}
